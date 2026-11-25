import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./RoutePreview.css";
import { BackLink } from "../components/common/BackLink";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { BottomNav } from "../components/common/BottomNav";
import featuredHeartRoute from "../assets/featured-heart-route.png";

type LocationState = {
    routeImage?: string;
    distance?: string;
    duration?: string;
};

export const RoutePreviewPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const state = (location.state as LocationState) || {};
    const routeImage = state.routeImage || featuredHeartRoute;
    

    const [userName, setUserName] = useState<string> ("You");
    

    //Fetch logged in user's name
    useEffect(() => {
        const token = localStorage.getItem("vango_token");

        if (!token) return;

        const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
        fetch(`${API_BASE}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { 
            if (data?.user?.name) {
                setUserName(data.user.name);
        }
    })
    .catch(() => {});
    }, []);
    const handleReadyToSubmit = () => {
        navigate(`/challenges/${id ?? "1"}/activity`);
    };
    return (
        <div className="route-preview-page">
            <BackLink pathDestination={`/challenges/${id ?? "1"}/activity`}
            pathName="Your activity"/>

            <div className="route-preview-header">
                <PageHeader title="Preview your entry" subtitle="Here is how other participants will see your route in the voting gallery."/>
            </div>

            {/* Card Preview similar to VotingPage */}
            <section className="preview-card-section" aria-label="Route Voting Preview">
                <article className="preview-vote-card">
                    <div className="preview-image-container">
                        <img src={routeImage} alt="Route entry preview" className="preview-image"/>
                    </div>
                    <div className="preview-card-footer">
                        <div className="preview-participant-info">
                            <span className="preview-participant-name">{userName}</span>
                            {/* <span className="preview-distance">{distance}</span> */}
                        </div>
                        <div className="preview-checkmark-circle" aria-hidden="true">
                            
                        </div>
                    </div>
                </article>
            </section>
            {/* Action button */}
            <section className="route-preview-actions">
                <Button variant="primary" className="btn-ready-to-submit" onClick={handleReadyToSubmit}>Ready to Submit</Button>
            </section>

            <BottomNav />

        </div>
    );
};