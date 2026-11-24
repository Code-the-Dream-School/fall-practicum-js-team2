import React, {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import "./YourActivity.css";
import {BackLink} from "../components/common/BackLink";
import {PageHeader} from "../components/common/PageHeader";
import {Button} from "../components/common/Button";
import {BottomNav} from "../components/common/BottomNav";
import featuredHeartRoute from "../assets/featured-heart-route.png";

export const YourActivityPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

// user greeting
const [userName, setUserName] = useState<string>("Runner");

// Route Stats
const [distance] = useState<string>("3.2 mi");
const [duration] = useState<string>("42 min");

// Fetch logged in user
useEffect(() => {
    const token = localStorage.getItem("vango_token");
    if (!token) return;

    const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    fetch(`${API_BASE}/api/auth/me`, { headers: {
        Authorization: `Bearer ${token}`,
    },
})
.then ((res) => (res.ok ? res.json() : null))
.then ((data) => {
    if(data?.user?.name) {
        setUserName(data.user.name);
    }
})
.catch((err) => {
    console.warn("Could not load user profile:", err);
});
}, []);
// Submit for vote
const handleSubmitForVote = () => {
    navigate(`/challenges/${id ?? "1"}/vote`);
};
// Preview your Entry 
const handlePreview = () => {
    alert("Previewing entry for voting!");
};
// Keep Private
const handleKeepPrivate = () => {
    alert("Route saved to your personal activity log (Private).");
    navigate("/home");
};

return (
    <div className="acitivity-page">
        <BackLink pathDestination="/plan-route" pathName="Plan route" />

        <div className="activity-header">
            <PageHeader title={`Nice work, ${userName}!`} 
            subtitle="Your route is ready to submit." />
        </div>
        {/* Route Image */}
        <div className="activity-image-container">
            <img src={featuredHeartRoute} alt="Completed GPS route" className="activity-route-image" />

        </div>
        {/* Route Stats */}
        <section className="activity-stats-grid" aria-label="Route Statistics">
            <div className="activity-stat-card">
                <span className="stat-labe">Distance: </span>
                <span className="stat-value">{distance}</span>
            </div>
            <div className="activity-stat-card">
                <span className="stat-label">Time Taken: </span>
                <span className="stat-value">{duration}</span>
            </div>
        </section>

        {/* Action Buttons */}
        <section className="activity-actions" aria-label="Activity Actions">
            <Button variant="primary" className="btn-submit-vote" onClick={handleSubmitForVote}>Submit challenge for vote</Button>
            <Button className="btn-preview-entry" onClick={handlePreview}>Preview your entry</Button>
            <Button className="btn-keep-private" onClick={handleKeepPrivate}>Keep private</Button>
        </section>

        <BottomNav />
    </div>
);
};

