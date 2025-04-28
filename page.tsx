"use client";
import { useEffect, useState } from "react";
import TopRiders from "./top-riders";
import { Rider } from "./types";

export default function Home() {
    const [riders, setRiders] = useState<Rider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRiders = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
                if (!response.ok) {
                    throw new Error("Failed to fetch riders");
                }
                const data = await response.json();
                setRiders(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetchRiders();
    }, []);

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Riders List</h1>
                <p className="text-blue-500">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Riders List</h1>
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Tour De France Riders</h1>
            <ul className="list-disc pl-5">
                {riders.map((rider) => (
                    <li key={rider.id} className="mb-2">
                        <strong>{rider.name}</strong> - {rider.email}
                    </li>
                ))}
            </ul>
            <TopRiders />
        </div>
    );
}
