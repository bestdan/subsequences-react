// import React, { useEffect, useRef, useState } from 'react';

// const WebRTCConnection = ({ gameCode, playerId, players, isHost }) => {
//     const [connectionStatus, setConnectionStatus] = useState('disconnected');
//     const [messages, setMessages] = useState([]);
//     const [messageInput, setMessageInput] = useState('');
//     const wsRef = useRef(null);
//     const peerConnectionsRef = useRef({});
//     const dataChannelsRef = useRef({});

//     // WebSocket connection setup
//     useEffect(() => {
//         console.log('Initializing WebSocket connection...');
//         connectWebSocket();

//         return () => {
//             if (wsRef.current) {
//                 console.log('Cleaning up WebSocket connection...');
//                 wsRef.current.close();
//             }
//             // Clean up peer connections
//             Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
//             Object.values(dataChannelsRef.current).forEach(dc => dc.close());
//         };
//     }, [gameCode]); // Reconnect if gameCode changes

//     const connectWebSocket = () => {
//         try {
//             const ws = new WebSocket('ws://localhost:3001');
//             wsRef.current = ws;

//             ws.onopen = () => {
//                 console.log('WebSocket connection established');
//                 setConnectionStatus('connected');
                
//                 // Send initial game join message
//                 if (gameCode) {
//                     console.log('Sending game join message:', { gameCode, playerId });
//                     ws.send(JSON.stringify({
//                         type: 'join_game',
//                         data: { gameCode, playerId }
//                     }));
//                 }
//             };

//             ws.onmessage = async (event) => {
//                 try {
//                     const message = JSON.parse(event.data);
//                     console.log('Received WebSocket message:', message);
//                     handleSignalingMessage(message);
//                 } catch (error) {
//                     console.error('Error handling WebSocket message:', error);
//                 }
//             };

//             ws.onerror = (error) => {
//                 console.error('WebSocket error:', error);
//                 setConnectionStatus('error');
//             };

//             ws.onclose = () => {
//                 console.log('WebSocket connection closed');
//                 setConnectionStatus('disconnected');
                
//                 // Attempt to reconnect after a delay
//                 setTimeout(() => {
//                     if (wsRef.current?.readyState === WebSocket.CLOSED) {
//                         console.log('Attempting to reconnect...');
//                         connectWebSocket();
//                     }
//                 }, 3000);
//             };
//         } catch (error) {
//             console.error('Error creating WebSocket connection:', error);
//             setConnectionStatus('error');
//         }
//     };

//     // Handle incoming signaling messages
//     const handleSignalingMessage = async (message) => {
//         try {
//             switch (message.type) {
//                 case 'signal':
//                     console.log('Handling signal message from:', message.data.from);
//                     await handleSignalingData(message.data);
//                     break;

//                 default:
//                     console.log('Unknown message type:', message.type);
//             }
//         } catch (error) {
//             console.error('Error in handleSignalingMessage:', error);
//         }
//     };

//     // Handle WebRTC signaling data
//     const handleSignalingData = async ({ from, signal }) => {
//         try {
//             let peerConnection = peerConnectionsRef.current[from];

//             if (!peerConnection) {
//                 console.log('Creating new peer connection for:', from);
//                 peerConnection = createPeerConnection(from);
//                 peerConnectionsRef.current[from] = peerConnection;
//             }

//             if (signal.sdp) {
//                 console.log('Processing SDP:', signal.sdp.type);
//                 await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
//                 if (signal.sdp.type === 'offer') {
//                     const answer = await peerConnection.createAnswer();
//                     await peerConnection.setLocalDescription(answer);
//                     sendSignalingMessage(from, { sdp: answer });
//                 }
//             } else if (signal.ice) {
//                 console.log('Processing ICE candidate');
//                 try {
//                     await peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
//                 } catch (e) {
//                     console.error('Error adding ICE candidate:', e);
//                 }
//             }
//         } catch (error) {
//             console.error('Error in handleSignalingData:', error);
//         }
//     };

//     // Create a new WebRTC peer connection
//     const createPeerConnection = (targetPeerId) => {
//         console.log('Creating peer connection for:', targetPeerId);
//         const configuration = {
//             iceServers: [
//                 { urls: 'stun:stun.l.google.com:19302' }
//             ]
//         };

//         const peerConnection = new RTCPeerConnection(configuration);

//         // Set up data channel
//         const dataChannel = peerConnection.createDataChannel('messageChannel', {
//             ordered: true,
//         });
//         setupDataChannel(dataChannel, targetPeerId);

//         // Handle incoming data channels
//         peerConnection.ondatachannel = (event) => {
//             console.log('Received data channel from:', targetPeerId);
//             setupDataChannel(event.channel, targetPeerId);
//         };

//         peerConnection.onicecandidate = (event) => {
//             if (event.candidate) {
//                 console.log('Sending ICE candidate to:', targetPeerId);
//                 sendSignalingMessage(targetPeerId, { ice: event.candidate });
//             }
//         };

//         peerConnection.onconnectionstatechange = () => {
//             console.log(`Connection state with ${targetPeerId}:`, peerConnection.connectionState);
//         };

//         peerConnection.onicegatheringstatechange = () => {
//             console.log(`ICE gathering state with ${targetPeerId}:`, peerConnection.iceGatheringState);
//         };

//         peerConnection.onsignalingstatechange = () => {
//             console.log(`Signaling state with ${targetPeerId}:`, peerConnection.signalingState);
//         };

//         return peerConnection;
//     };

//     // Set up data channel handlers
//     const setupDataChannel = (channel, peerId) => {
//         channel.onopen = () => {
//             console.log(`Data channel with ${peerId} opened`);
//             dataChannelsRef.current[peerId] = channel;
//         };

//         channel.onclose = () => {
//             console.log(`Data channel with ${peerId} closed`);
//             delete dataChannelsRef.current[peerId];
//         };

//         channel.onerror = (error) => {
//             console.error(`Data channel error with ${peerId}:`, error);
//         };

//         channel.onmessage = (event) => {
//             try {
//                 const message = JSON.parse(event.data);
//                 console.log(`Received message from ${peerId}:`, message);
//                 setMessages(prev => [...prev, { from: peerId, content: message.content, timestamp: new Date() }]);
//             } catch (error) {
//                 console.error('Error handling data channel message:', error);
//             }
//         };
//     };

//     // Send signaling message through WebSocket
//     const sendSignalingMessage = (targetPeerId, signal) => {
//         if (wsRef.current?.readyState === WebSocket.OPEN) {
//             const message = {
//                 type: 'signal',
//                 data: {
//                     target: targetPeerId,
//                     signal
//                 }
//             };
//             console.log('Sending signal message:', message);
//             wsRef.current.send(JSON.stringify(message));
//         } else {
//             console.warn('WebSocket not ready, cannot send signal');
//         }
//     };

//     // Initiate connection with a peer
//     const connectToPeer = async (targetPeerId) => {
//         try {
//             console.log('Initiating connection to peer:', targetPeerId);
//             const peerConnection = createPeerConnection(targetPeerId);
//             peerConnectionsRef.current[targetPeerId] = peerConnection;

//             const offer = await peerConnection.createOffer();
//             await peerConnection.setLocalDescription(offer);
//             sendSignalingMessage(targetPeerId, { sdp: offer });
//         } catch (error) {
//             console.error('Error connecting to peer:', error);
//         }
//     };

//     // Send message through data channel
//     const sendMessage = (targetPeerId) => {
//         const dataChannel = dataChannelsRef.current[targetPeerId];
//         if (dataChannel?.readyState === 'open' && messageInput.trim()) {
//             const message = {
//                 content: messageInput.trim(),
//                 timestamp: new Date(),
//             };
//             console.log('Sending message to peer:', targetPeerId, message);
//             dataChannel.send(JSON.stringify(message));
//             setMessages(prev => [...prev, { ...message, from: 'me' }]);
//             setMessageInput('');
//         } else {
//             console.warn('Data channel not ready or empty message');
//         }
//     };

//     return (
//         <div className="webrtc-connection">
//             <div className="connection-status">
//                 <div className="status-indicator">
//                     Connection Status: {connectionStatus}
//                 </div>
//                 <h4>Connected Players:</h4>
//                 <ul>
//                     {Array.from(players).map(player => (
//                         player !== playerId && (
//                             <li key={player}>
//                                 <span>{player}</span>
//                                 <div className="peer-controls">
//                                     {!dataChannelsRef.current[player] && (
//                                         <button onClick={() => connectToPeer(player)}>
//                                             Connect
//                                         </button>
//                                     )}
//                                     {dataChannelsRef.current[player]?.readyState === 'open' && (
//                                         <div className="message-input">
//                                             <input
//                                                 type="text"
//                                                 value={messageInput}
//                                                 onChange={(e) => setMessageInput(e.target.value)}
//                                                 placeholder="Type a message..."
//                                                 onKeyPress={(e) => e.key === 'Enter' && sendMessage(player)}
//                                             />
//                                             <button onClick={() => sendMessage(player)}>Send</button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </li>
//                         )
//                     ))}
//                 </ul>
//                 <div className="messages">
//                     <h4>Messages:</h4>
//                     <ul>
//                         {messages.map((msg, index) => (
//                             <li key={index} className={msg.from === 'me' ? 'sent' : 'received'}>
//                                 <span className="message-sender">{msg.from === 'me' ? 'You' : msg.from}:</span>
//                                 <span className="message-content">{msg.content}</span>
//                                 <span className="message-time">
//                                     {new Date(msg.timestamp).toLocaleTimeString()}
//                                 </span>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default WebRTCConnection;
