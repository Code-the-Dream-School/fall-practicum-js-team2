import React, {useState, useEffect} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import "./YourActivity.css";
import {BackLink} from "../components/common/BackLink";
import {PageHeader} from "../components/common/PageHeader";
import {Button} from "../components/common/Button";
import {BottomNav} from "../components/common/BottomNav";
import featuredHeartRoute from "../assets/featured-heart-route.png";

export const YourActivityPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();


const passedImage = (location.state as {routeImage?: string })?.routeImage;

// user greeting
const [userName, setUserName] = useState<string>("friend");

// Route Image state
const [routeImage] = useState<string>(passedImage || featuredHeartRoute); //add setRouteImage when backend is ready

// Route Stats
const [distance] = useState<string>("3.2 mi");
const [duration] = useState<string>("42 min");
const [saveMessage, setSaveMessage] = useState<string | null>(null);

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

// Backend Skeleton for route image fetch
/*async function fetchDrawing(){
    try {
        const response = await fetch (`${API_BASE}/api/games/${id ?? '1'}/drawings`, {
            headers: {Authorization: `Bearer ${token}`}
        });
        const result = await response.json();

        if (result.success && result.data?.imageUrl) {
            setRouteImage(result.data.imageUrl);
        }
    } catch (error) {
        console.error("Error fetching drawing:", error);
    }
}
fetchDrawing();
*/

}, [id]);

// Submit for vote
const handleSubmitForVote = async () => {   
    console.log(`Submitting drawing for challenge #${id ?? '1'}...`);

    //Backend fetch skeleton:

    /*  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
        const token = localStorage.getItem("vango_token");
        try { const reponse = await fetch (`${API_BASE}/api/games/${id ?? '1'}/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            coordinates: [
                {lat: 35.7796, lng: -78.6382},
                {lat: 35.7801, lng: -78.6390}
                ]
        })
    //Note: will change coordinates with ({coordinates : userRunCoordinates})
    
    });
    const result = await response.json();
    console.log("Submission response: result");
} catch (error){
    console.error("Error submitting drawing:", error);
}
*/
    navigate(`/challenges/${id ?? "1"}/vote`);
};

// Preview your Entry goes to seperate screen
const handlePreview = () => {
    navigate(`/challenges/${id ?? "1"}/preview`, {
        state: {
            routeImage,
            distance,
            duration,
            from: `/challenges/${id ?? "1"}/activity`,
        },
    });
};

// Keep Private displays confirmation banner and navigates /home
const handleKeepPrivate = () => {
setSaveMessage("✓ Route image was saved privately to your profile");


    // Backend Skeleton to save route image to user profile
    /* const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    const token = localStorage.getItem("vango_token");
    try {
    await fetch (`${API_BASE}/api/users/activities`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            distance,
            duration,
            imageUrl: routeImage,
            isPrivate: true,
        }),
    });
    } catch (err) {
    console.error("Error saving private route:", err);
    }
    */

    // Smoothly transitions to Home after 3 sec 
    setTimeout(() => {
        navigate("/home");
    }, 3000);
    
};

return (
    <div className="activity-page">
        {/* image save success banner */}
        {saveMessage && (<div className="activity-save-banner" role="status">{saveMessage}</div>)}

        {/* BackLink to plan your route */}
        <BackLink pathDestination="/plan-route" pathName="Plan route" />

        <div className="activity-header">
            <PageHeader title={`Nice work, ${userName}!`} 
            subtitle="Your route is ready to submit." />
        </div>
        {/* Route Image */}
        <div className="activity-image-container">
            <img src={routeImage} alt="Completed GPS route" className="activity-route-image" />

        </div>
        {/* Route Stats */}
        <section className="activity-stats-grid" aria-label="Route Statistics">
            <div className="activity-stat-card">
                <span className="stat-label">Distance: </span>
                <span className="stat-value">{distance}</span>
            </div>
            <div className="activity-stat-card">
                <span className="stat-label">Time Taken: </span>
                <span className="stat-value">{duration}</span>
            </div>
        </section>

        {/* Action Buttons */}
        <section className="activity-actions" aria-label="Activity Actions">           
            <Button className="btn-preview-entry" onClick={handlePreview}>Preview your entry</Button>
            <Button className="btn-keep-private" onClick={handleKeepPrivate}>Keep private</Button>
            <Button variant="primary" className="btn-submit-vote" onClick={handleSubmitForVote}>Submit challenge for vote</Button>
        </section>

        <BottomNav />
    </div>
);
};

