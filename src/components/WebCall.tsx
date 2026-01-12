import { useEffect, useRef, useCallback } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { useStore } from '@nanostores/react'
import { $retellVariables } from '../stores/retellVariables'
import { $callState, setCallState } from '../stores/callState'
import { $callerPhoneNumber } from '../stores/phoneNumber'

interface WebCallProps {
  agentId: string;
}

interface CallStartedEvent {
  id?: string;
}

// Module-level singleton to ensure only one client exists
let retellWebClient: RetellWebClient | null = null;
let isClientInitialized = false;
let isStopping = false;
let isStarting = false;
let lastToggleTime = 0;
const TOGGLE_DEBOUNCE_MS = 1000; // 1 second debounce between any toggle actions

export default function WebCall({ agentId }: WebCallProps) {
  const variables = useStore($retellVariables)
  const currentState = useStore($callState)
  const callerPhoneNumber = useStore($callerPhoneNumber)
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Only initialize once globally
    if (isClientInitialized && retellWebClient) {
      console.log("WebCall: Client already initialized, skipping");
      return;
    }

    console.log("WebCall: Initializing client");
    isClientInitialized = true;
    retellWebClient = new RetellWebClient();

    retellWebClient.on("call_started", (event: CallStartedEvent) => {
      console.log("call started", event);
      if (isStopping) {
        console.log("Ignoring call_started because we're stopping");
        return;
      }
      isStarting = false;
      setCallState({
        isCalling: true,
        callStatus: "Call in progress",
        callId: event?.id || null
      });
    });

    retellWebClient.on("call_ended", () => {
      console.log("call ended");
      isStopping = false;
      isStarting = false;
      setCallState({
        isCalling: false,
        callStatus: "Call ended",
        callId: null,
        agentState: "Idle"
      });
    });

    retellWebClient.on("agent_start_talking", () => {
      console.log("agent_start_talking");
      if (!isStopping) {
        setCallState({ agentState: "Speaking" });
      }
    });

    retellWebClient.on("agent_stop_talking", () => {
      console.log("agent_stop_talking");
      if (!isStopping) {
        setCallState({ agentState: "Listening" });
      }
    });

    retellWebClient.on("error", (error: any) => {
      console.error("An error occurred:", error);
      isStopping = false;
      isStarting = false;
      setCallState({
        isCalling: false,
        callStatus: `Error: ${error?.message || 'Unknown error occurred'}`,
        callId: null,
        agentState: "Idle"
      });
      retellWebClient?.stopCall();
    });

    // Cleanup on unmount - but don't destroy the client
    return () => {
      mountedRef.current = false;
      // Don't reset isClientInitialized - keep the singleton alive
    };
  }, []);

  const startCall = useCallback(async () => {
    // Debounce
    const now = Date.now();
    const timeSinceLastToggle = now - lastToggleTime;
    if (timeSinceLastToggle < TOGGLE_DEBOUNCE_MS) {
        console.log(`Start call debounced. Ignoring.`);
        return;
    }
    lastToggleTime = now;

    if (!retellWebClient) return;

    const currentState = $callState.get();
    if (currentState.isCalling || isStarting || isStopping) {
        console.log("Cannot start call: Call already in progress, starting, or stopping");
        return;
    }

    try {
        const freshCallerPhoneNumber = $callerPhoneNumber.get();
        const freshVariables = $retellVariables.get();
        console.log("Starting call with variables:", freshVariables, "and phone:", freshCallerPhoneNumber);

        isStarting = true;
        setCallState({
          callStatus: "Initiating call...",
          callId: null
        });

        const response = await fetch(`${window.location.origin}/api/create-web-call`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: agentId,
            retell_llm_dynamic_variables: {
              ...freshVariables,
              user_phone: freshCallerPhoneNumber
            }
          }),
        });

        if (!response.ok) {
          isStarting = false;
          throw new Error(`Server error: ${response.status}`);
        }

        if (isStopping || !mountedRef.current) {
          isStarting = false;
          return;
        }

        const data = await response.json();

        if (isStopping || !mountedRef.current) {
          isStarting = false;
          return;
        }

        await retellWebClient.startCall({
          accessToken: data.access_token,
        });
    } catch (err: any) {
        console.error("Failed to start call:", err);
        isStarting = false;
        setCallState({
          isCalling: false,
          callStatus: `Failed to start call: ${err?.message || 'Unknown error'}`,
          callId: null,
          agentState: "Idle"
        });
    }
  }, [agentId, variables, callerPhoneNumber]);

  const stopCall = useCallback(async () => {
    // Debounce
    const now = Date.now();
    const timeSinceLastToggle = now - lastToggleTime;
    if (timeSinceLastToggle < TOGGLE_DEBOUNCE_MS) {
        console.log(`Stop call debounced. Ignoring.`);
        return;
    }
    lastToggleTime = now;

    if (!retellWebClient) return;

    const currentState = $callState.get();
    
    if (isStopping) {
        console.log("Already stopping call, ignoring");
        return;
    }

    if (!currentState.isCalling && !isStarting) {
        console.log("Call already stopped");
        return;
    }

    try {
        console.log("Stopping call...");
        isStopping = true;
        isStarting = false; // Cancel any pending start
        setCallState({ callStatus: "Ending call..." });

        await retellWebClient.stopCall();

        setCallState({
          isCalling: false,
          callStatus: "Call ended",
          callId: null,
          agentState: "Idle"
        });
        isStopping = false;
    } catch (err) {
        console.error("Error stopping call:", err);
        isStopping = false;
        setCallState({
          isCalling: false,
          callStatus: "Error stopping call",
          callId: null,
          agentState: "Idle"
        });
    }
  }, []);

  const toggleConversation = useCallback(async () => {
    const currentState = $callState.get();
    if (currentState.isCalling || isStopping) {
        await stopCall();
    } else {
        await startCall();
    }
  }, [startCall, stopCall]);

  return (
    <div className="webcall-container" id="hidden-webcall">
      <div className="call-info">
        <div className="status-item">
          <span className="label">Status:</span>
          <span className={`value ${currentState.callStatus.toLowerCase().replace(/\s+/g, '-')}`}>
            {currentState.callStatus}
          </span>
        </div>
        <div className="status-item">
          <span className="label">Agent State:</span>
          <span className={`value ${currentState.agentState.toLowerCase()}`}>
            {currentState.agentState}
          </span>
        </div>
        {currentState.callId && (
          <div className="status-item">
            <span className="label">Call ID:</span>
            <span className="value">{currentState.callId}</span>
          </div>
        )}
      </div>

      <button
        onClick={toggleConversation}
        className="webcall-button"
      >
        {currentState.isCalling ? "Stop Call" : "Start Call"}
      </button>

      {/* Hidden buttons for dedicated control */}
      <button 
        id="webcall-start-btn" 
        onClick={startCall} 
        style={{ display: 'none' }}
      >Start</button>
      <button 
        id="webcall-stop-btn" 
        onClick={stopCall}
        style={{ display: 'none' }}
      >Stop</button>

      <style>{`
        .webcall-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          gap: 20px;
        }

        .call-info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          width: 100%;
          max-width: 400px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 8px;
          background: white;
          border-radius: 4px;
        }

        .label {
          font-weight: bold;
          color: #666;
        }

        .value {
          padding: 2px 8px;
          border-radius: 4px;
          background: #eee;
        }

        .value.speaking {
          background: #4CAF50;
          color: white;
        }

        .value.listening {
          background: #2196F3;
          color: white;
        }

        .value.call-in-progress {
          background: #4CAF50;
          color: white;
        }

        .value.error {
          background: #ff4444;
          color: white;
        }

        .webcall-button {
          padding: 12px 24px;
          font-size: 16px;
          border-radius: 8px;
          border: none;
          background-color: #4CAF50;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .webcall-button:hover {
          background-color: #45a049;
        }
      `}</style>
    </div>
  );
}
