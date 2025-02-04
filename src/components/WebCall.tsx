import { useEffect } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { useStore } from '@nanostores/react'
import { $retellVariables } from '../stores/retellVariables'
import { $callState, setCallState } from '../stores/callState'

interface WebCallProps {
  agentId: string;
}

interface CallStartedEvent {
  id?: string;
}

const retellWebClient = new RetellWebClient();

export default function WebCall({ agentId }: WebCallProps) {
  const variables = useStore($retellVariables)
  const currentState = useStore($callState)

  useEffect(() => {
    retellWebClient.on("call_started", (event: CallStartedEvent) => {
      console.log("call started", event);
      setCallState({
        callStatus: "Call in progress",
        callId: event?.id || null
      });
    });
    
    retellWebClient.on("call_ended", () => {
      console.log("call ended");
      setCallState({
        isCalling: false,
        callStatus: "Call ended",
        agentState: "Idle"
      });
    });
    
    retellWebClient.on("agent_start_talking", () => {
      console.log("agent_start_talking");
      setCallState({ agentState: "Speaking" });
    });
    
    retellWebClient.on("agent_stop_talking", () => {
      console.log("agent_stop_talking");
      setCallState({ agentState: "Listening" });
    });
    
    retellWebClient.on("error", (error: any) => {
      console.error("An error occurred:", error);
      setCallState({
        callStatus: `Error: ${error?.message || 'Unknown error occurred'}`,
        callId: null,
        agentState: "Idle"
      });
      retellWebClient.stopCall();
    });

    return () => {
      retellWebClient.removeAllListeners();
    };
  }, []);

  const toggleConversation = async () => {
    const currentState = $callState.get();
    
    if (currentState.isCalling) {
      try {
        await retellWebClient.stopCall();
      } catch (err) {
        console.error("Error stopping call:", err);
        setCallState({ callStatus: "Error stopping call" });
      }
    } else {
      try {
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
            retell_llm_dynamic_variables: variables
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        
        await retellWebClient.startCall({
          accessToken: data.access_token,
        });
        
        setCallState({ isCalling: true });
      } catch (err: any) {
        console.error("Failed to start call:", err);
        setCallState({
          callStatus: `Failed to start call: ${err?.message || 'Unknown error'}`,
          callId: null,
          agentState: "Idle"
        });
      }
    }
  };

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