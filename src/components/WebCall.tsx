import { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { useStore } from '@nanostores/react'
import { $retellVariables } from '../stores/retellVariables'

interface WebCallProps {
  agentId: string;
}

interface CallStartedEvent {
  id?: string;
}

const retellWebClient = new RetellWebClient();

export default function WebCall({ agentId }: WebCallProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("Not started");
  const [callId, setCallId] = useState<string | null>(null);
  const [agentState, setAgentState] = useState("Idle");
  const variables = useStore($retellVariables)

  useEffect(() => {
    // Initialize event listeners
    retellWebClient.on("call_started", (event: CallStartedEvent) => {
      console.log("call started", event);
      setCallStatus("Call in progress");
      if (event?.id) {
        setCallId(event.id);
      }
    });
    
    retellWebClient.on("call_ended", () => {
      console.log("call ended");
      setIsCalling(false);
      setCallStatus("Call ended");
      setAgentState("Idle");
    });
    
    retellWebClient.on("agent_start_talking", () => {
      console.log("agent_start_talking");
      setAgentState("Speaking");
    });
    
    retellWebClient.on("agent_stop_talking", () => {
      console.log("agent_stop_talking");
      setAgentState("Listening");
    });
    
    retellWebClient.on("error", (error: any) => {
      console.error("An error occurred:", error);
      setCallStatus(`Error: ${error?.message || 'Unknown error occurred'}`);
      setCallId(null);
      setAgentState("Idle");
      retellWebClient.stopCall();
    });

    // Cleanup listeners on unmount
    return () => {
      retellWebClient.removeAllListeners();
    };
  }, []);

  const toggleConversation = async () => {
    if (isCalling) {
      try {
        await retellWebClient.stopCall();
      } catch (err) {
        console.error("Error stopping call:", err);
        setCallStatus("Error stopping call");
      }
    } else {
      try {
        setCallStatus("Initiating call...");
        setCallId(null);
        
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
        
        setIsCalling(true);
      } catch (err: any) {
        console.error("Failed to start call:", err);
        setCallStatus(`Failed to start call: ${err?.message || 'Unknown error'}`);
        setCallId(null);
        setAgentState("Idle");
      }
    }
  };

  return (
    <div className="webcall-container">
      <div className="call-info">
        <div className="status-item">
          <span className="label">Status:</span>
          <span className={`value ${callStatus.toLowerCase().replace(/\s+/g, '-')}`}>
            {callStatus}
          </span>
        </div>
        <div className="status-item">
          <span className="label">Agent State:</span>
          <span className={`value ${agentState.toLowerCase()}`}>
            {agentState}
          </span>
        </div>
        {callId && (
          <div className="status-item">
            <span className="label">Call ID:</span>
            <span className="value">{callId}</span>
          </div>
        )}
      </div>

      <button 
        onClick={toggleConversation}
        className="webcall-button"
      >
        {isCalling ? "Stop Call" : "Start Call"}
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