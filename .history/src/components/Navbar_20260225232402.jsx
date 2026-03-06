import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold text-lg">AI PDF Chatbot</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Upload</Link>
        <Link to="/chat" className="hover:underline">Chat</Link>
      </div>
    </nav>
  );
}