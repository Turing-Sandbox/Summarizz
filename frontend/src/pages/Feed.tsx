import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../hooks/useAuth";
import { apiURL } from "../scripts/api";

import { User } from "../models/User";
import ContentList from "../components/feed/ContentList";

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

      let creatorsFetched = false;

      // Only fetch related creators if we have a user
      if (auth.user?.uid) {
        creatorsFetched = await fetchRelatedCreators();
      }

      if (auth.user?.uid && !creatorsFetched) {
        setErrorCreators(
          "Failed to fetch related creators. Please reload the page or contact support."
        );
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRelatedCreators(): Promise<boolean> {
    if (!auth.user?.uid) {
      setCreatorProfiles([]);
      return false;
    }

    try {
      const creatorsResponse = await axios.get(
        `${apiURL}/content/feed/creators/${auth.user.uid}`,
        { timeout: 8000 }
      );

      if (creatorsResponse.data && creatorsResponse.data.success) {
        const creatorIds = creatorsResponse.data.relatedCreators || [];

        if (creatorIds.length === 0) {
          setCreatorProfiles([]);
          return false;
        }

        // Profiles for each creator
        const profiles = await Promise.all(
          creatorIds.map(async (creatorId: string) => {
            try {
              const userResponse = await axios.get(
                `${apiURL}/user/${creatorId}`,
                { timeout: 5000 }
              );
              if (userResponse.data) {
                return userResponse.data;
              }
              return null;
            } catch {
              console.error(
                `Failed to fetch user profile for ID: ${creatorId}`
              );
              return null;
            }
          })
        );

        // Filter null profiles or profiles that don't exist
        const validProfiles = profiles.filter((profile) => profile !== null);
        console.log("Valid creator profiles:", validProfiles);

        if (validProfiles.length > 0) {
          setCreatorProfiles(validProfiles);
          return true;
        } else {
          setCreatorProfiles([]);
          return false;
        }
      } else {
        setCreatorProfiles([]);
      }
    } catch {
      setCreatorProfiles([]);
    }
    return false;
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
              {creatorProfiles.map((creator) => (
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
