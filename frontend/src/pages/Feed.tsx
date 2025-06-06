import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider/useAuth";
import { User } from "../models/User";
import ContentList from "../components/feed/ContentList";
import UserService from "../services/UserService";

export default function Feed() {
  const [creatorProfiles, setCreatorProfiles] = useState<User[]>([]);

  const navigate = useNavigate();
  const auth = useAuth();

  const [tab, setTab] = useState<"personalized" | "trending" | "latest">(
    auth.user ? "personalized" : "trending"
  );

  const [errorCreators, setErrorCreators] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setErrorCreators(null);

      await fetchRelatedCreators();
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRelatedCreators() {
    if (!auth.user?.uid) {
      setCreatorProfiles([]);
      return;
    }

    const relatedCreators = await UserService.getRelatedContentCreators(
      auth.user.uid
    );

    if (relatedCreators instanceof Error) {
      setErrorCreators(
        relatedCreators.message || "Failed to fetch related creators."
      );
      return;
    }

    setCreatorProfiles(relatedCreators);
  }

  return (
    <div className='main-content'>
      {auth.user && <h1>Welcome, {auth.user.firstName}</h1>}

      {auth.user && (
        <div>
          {/* Related Creators Section */}
          <h2 className='feed-section-h2'>Creators You Might Like</h2>

          {creatorProfiles.length === 0 ? (
            <h3>No related creators found</h3>
          ) : (
            <div className='creator-profiles-list'>
              {creatorProfiles.slice(0, 5).map((creator) => (
                <div
                  key={creator.uid}
                  className='creator-profile-card'
                  onClick={() => navigate(`/profile/${creator.uid}`)}
                >
                  {creator.profileImage ? (
                    <img
                      src={creator.profileImage}
                      alt={creator.username}
                      width={80}
                      height={80}
                      className='creator-profile-image'
                    />
                  ) : (
                    <div className='creator-profile-placeholder'>
                      <h1>{creator.firstName?.charAt(0) || "?"}</h1>
                    </div>
                  )}
                  <div className='creator-profile-info'>
                    <span className='creator-username'>
                      @{creator.username}
                    </span>
                    <span className='creator-name'>
                      {creator.firstName} {creator.lastName}
                    </span>
                    <span className='creator-followers'>
                      {creator.followers?.length || 0} followers
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {errorCreators && <p className='error'>{errorCreators}</p>}
        </div>
      )}

      {/* TABS */}
      <div className='tabs'>
        {auth.user && (
          <button
            onClick={() => setTab("personalized")}
            className={tab === "personalized" ? "tab-active" : "tab-inactive"}
          >
            For You
          </button>
        )}
        <button
          onClick={() => setTab("trending")}
          className={tab === "trending" ? "tab-active" : "tab-inactive"}
        >
          Trending
        </button>
        <button
          onClick={() => setTab("latest")}
          className={tab === "latest" ? "tab-active" : "tab-inactive"}
        >
          Latest
        </button>
      </div>

      <ContentList tab={tab} />
    </div>
  );
}
