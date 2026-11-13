import "./FeaturedChallengeCard.css";
import heartRoute from "../../assets/featured-heart-route.png";

type FeaturedChallengeCardProps = {
  title?: string;
  description?: string;
  imageSrc?: string;
  alt?: string;
};

export function FeaturedChallengeCard({
  title,
  description,
  imageSrc,
  alt,
}: FeaturedChallengeCardProps) {
  return (
    <section className="home-featured-challenge-section">
      <div>
        <p className="challenge-label">FEATURED CHALLENGE</p>
        <h2>{title?.trim() || "Draw a shape"}</h2>
        <p className="challenge-description">
          {description?.trim() || "Turn your next walk into a work of art."}
        </p>
      </div>
      <img
        className="featured-challenge-image"
        src={imageSrc || heartRoute}
        alt={alt?.trim() || "walking route on a street map"}
      />
    </section>
  );
}
