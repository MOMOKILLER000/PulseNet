// PulseTransaction.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { ArrowLeft, ArrowRight, Heart, MessageSquare } from "lucide-react";
import styles from "../../styles/Pulses_pages/pulseTransaction.module.css";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import "maplibre-gl/dist/maplibre-gl.css";

function getCookie(name) {
    let cookieValue = null;
    if (typeof document === "undefined") return null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function formatLocation(location) {
    if (!location) return "Not specified";
    if (Array.isArray(location)) return `${location[1].toFixed(4)}°N, ${location[0].toFixed(4)}°E`;
    if (location.coordinates) return `${location.coordinates[1].toFixed(4)}°N, ${location.coordinates[0].toFixed(4)}°E`;
    return String(location);
}

export default function PulseTransaction() {
    const { pulseId } = useParams();
    const navigate = useNavigate();

    const [pulse, setPulse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [index, setIndex] = useState(0);

    // Transaction fields
    const [quantity, setQuantity] = useState(1);
    const [period, setPeriod] = useState(""); // for services
    const [instructions, setInstructions] = useState("");
    const [transactionLoading, setTransactionLoading] = useState(false);

    const mapRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        const fetchPulse = async () => {
            try {
                const res = await fetch(`http://localhost:8000/accounts/pulse/${pulseId}/`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (mounted && data.success) setPulse(data.pulse);
            } catch (err) {
                console.error(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchPulse();
        return () => (mounted = false);
    }, [pulseId]);

    const images = useMemo(() => (pulse && pulse.images ? pulse.images : []), [pulse]);
    const coords = pulse ? (Array.isArray(pulse.location) ? pulse.location : pulse.location.coordinates) : [27.5766, 47.1585];
    const isService = pulse?.type === "servicii";

    const next = () => images.length && setIndex(i => (i + 1) % images.length);
    const prev = () => images.length && setIndex(i => (i - 1 + images.length) % images.length);

    const handleTransaction = async () => {
        if (!quantity || (isService && !period)) {
            alert("Please fill all required fields.");
            return;
        }
        setTransactionLoading(true);
        try {
            const csrfToken = getCookie("csrftoken");
            const body = {
                pulse_id: pulse.id,
                quantity,
                period: isService ? period : null,
                instructions,
            };
            const res = await fetch("http://localhost:8000/accounts/create_transaction/", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setStatus("✅ Transaction successful!");
                setTimeout(() => navigate("/"), 2000);
            } else setStatus(`❌ ${data.error || "Transaction failed"}`);
        } catch (err) {
            console.error(err);
            setStatus("❌ Error during transaction");
        } finally {
            setTransactionLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-20">Loading...</div>;
    if (!pulse) return <div className="text-center mt-20">Pulse not found</div>;

    return (
        <div className={styles.body}>
            <Navbar />

            <div className={styles.mainContainer}>
                <h1 className="text-3xl font-bold mb-6">
                    {isService ? "Book Service" : "Purchase Item"}: {pulse.name}
                </h1>

                {/* Carousel */}
                <div className="flex items-center mb-6">
                    <button onClick={prev}><ArrowLeft size={24} /></button>
                    {images.length ? <img src={images[index]} className="w-64 h-64 object-cover mx-4 rounded-lg" /> :
                        <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded-lg">No image</div>}
                    <button onClick={next}><ArrowRight size={24} /></button>
                </div>

                {/* Details */}
                <div className="mb-6 space-y-2">
                    <p><strong>Price:</strong> {pulse.price} {pulse.currency}</p>
                    <p><strong>Posted by:</strong> @{pulse.user}</p>
                </div>

                {/* Transaction form */}
                <div className="mb-6 space-y-4">
                    {!isService && (
                        <div>
                            <label className="block mb-1 font-semibold">Quantity</label>
                            <input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                className="border rounded px-2 py-1 w-32"
                            />
                        </div>
                    )}

                    {isService && (
                        <div>
                            <label className="block mb-1 font-semibold">Rental / Service period</label>
                            <input
                                type="text"
                                placeholder="e.g., 3 days"
                                value={period}
                                onChange={e => setPeriod(e.target.value)}
                                className="border rounded px-2 py-1 w-64"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block mb-1 font-semibold">Additional Instructions</label>
                        <textarea
                            placeholder="Special requests..."
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                            className="border rounded px-2 py-1 w-64 h-24"
                        />
                    </div>
                </div>

                {/* Confirm button */}
                <button
                    className={`px-6 py-3 rounded-lg font-semibold ${
                        isService ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                    onClick={handleTransaction}
                    disabled={transactionLoading}
                >
                    {transactionLoading ? "Processing..." : isService ? "Book Now" : "Buy Now"}
                </button>

                {status && <p className="mt-4 text-lg">{status}</p>}

                {/* Map */}
                <div className="mt-6 h-64 w-full rounded-lg overflow-hidden">
                    <Map key={`${coords[0]}-${coords[1]}-${pulse.id}`} ref={mapRef} center={coords} zoom={16}>
                        <MapMarker longitude={coords[0]} latitude={coords[1]}>
                            <MarkerContent>
                                <div style={{
                                    width: "22px",
                                    height: "22px",
                                    backgroundColor: "#ff3b30",
                                    borderRadius: "50% 50% 50% 0",
                                    transform: "translate(-50%, -100%) rotate(-45deg)",
                                    border: "2px solid white",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
                                }} />
                            </MarkerContent>
                        </MapMarker>
                    </Map>
                </div>

                {/* Seller info */}
                <div className="mt-6 p-4 border rounded-lg">
                    <h3 className="font-bold mb-2">Seller</h3>
                    <p>@{pulse.user}</p>
                    <button
                        className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                        onClick={() => navigate(`/direct-chat/${pulse.user_id}`)}
                    >
                        <MessageSquare size={16} className="mr-1" /> Contact
                    </button>
                </div>
            </div>
        </div>
    );
}