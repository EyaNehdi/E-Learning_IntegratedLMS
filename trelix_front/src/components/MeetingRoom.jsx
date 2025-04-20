import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

export default function MeetingRoom() {
  const { roomId } = useParams();
  const videoContainerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";  // Jitsi Meet API
    script.onload = () => {
      const domain = "meet.jit.si";
      const options = {
        roomName: roomId,  // Nom de la salle
        width: "100%",
        height: "100%",
        parentNode: videoContainerRef.current,
        configOverwrite: { startWithAudioMuted: true },
        interfaceConfigOverwrite: { filmStripOnly: false },
      };
      const api = new window.JitsiMeetExternalAPI(domain, options);
    };
    document.body.appendChild(script);
  }, [roomId]);

  return <div ref={videoContainerRef} style={{ height: "100vh", width: "100%" }} />;
}
