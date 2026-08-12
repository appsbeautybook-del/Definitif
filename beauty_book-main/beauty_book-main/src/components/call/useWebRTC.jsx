import { useRef, useCallback } from "react";
import { supabase } from '@/api/supabaseClient';

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC({ callId, localStreamRef, onRemoteStream, onEnd }) {
  const pcRef = useRef(null);
  const callIdRef = useRef(callId);
  const onEndRef = useRef(onEnd);
  const disconnectedTimerRef = useRef(null);

  // Toujours garder la valeur à jour
  callIdRef.current = callId;
  onEndRef.current = onEnd;

  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.ontrack = (event) => {
      if (onRemoteStream) onRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        try {
          await supabase.from("call_signals").insert({
            call_id: callIdRef.current || "",
            caller_email: "_ice_",
            callee_email: "_ice_",
            signal_type: "ice-candidate",
            payload: JSON.stringify({ candidate: event.candidate, callId: callIdRef.current }),
          });
        } catch (_) {}
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (["failed", "closed"].includes(state)) {
        clearTimeout(disconnectedTimerRef.current);
        onEndRef.current && onEndRef.current();
      }
      if (state === "disconnected") {
        // Attendre 10s avant de couper (le disconnected est souvent transitoire)
        disconnectedTimerRef.current = setTimeout(() => {
          if (pcRef.current?.connectionState === "disconnected") {
            onEndRef.current && onEndRef.current();
          }
        }, 10000);
      }
      if (state === "connected") {
        clearTimeout(disconnectedTimerRef.current);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [onRemoteStream]);

  const addLocalTracks = useCallback((pc, stream) => {
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
  }, []);

  const createOffer = useCallback(async (stream) => {
    const pc = createPC();
    addLocalTracks(pc, stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }, [createPC, addLocalTracks]);

  const createAnswer = useCallback(async (stream, offerSDP) => {
    const pc = createPC();
    addLocalTracks(pc, stream);
    await pc.setRemoteDescription(new RTCSessionDescription(offerSDP));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }, [createPC, addLocalTracks]);

  const setRemoteAnswer = useCallback(async (answerSDP) => {
    if (pcRef.current) {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answerSDP));
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate) => {
    if (pcRef.current && pcRef.current.remoteDescription) {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    }
  }, []);

  const close = useCallback(() => {
    clearTimeout(disconnectedTimerRef.current);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }, []);

  return { createOffer, createAnswer, setRemoteAnswer, addIceCandidate, close, pcRef };
}
