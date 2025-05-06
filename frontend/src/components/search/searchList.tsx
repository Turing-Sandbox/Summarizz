import { Suspense, useEffect, useState } from "react";
import { User } from "../../models/User";
import { Content } from "../../models/Content";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../scripts/api";
import ContentSearchResult from "./ContentSearchResult";
import UserSearchResults from "./UserSearchResult";

function SearchListContent({
  userSearchResults,
  contentSearchResults,
}: {
  userSearchResults?: User[];
  contentSearchResults?: Content[];
} = {}) {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------

  // Retrieve the search text from the url.
  const [searchParams] = useSearchParams();
  const param = searchParams.get("query");
  const [usersReturned, setUsersReturned] = useState<User[]>([]);
  const [userDisabled, setUserDisabled] = useState(true);
  const [contentReturned, setContentReturned] = useState<Content[]>([]);

  const [userStartingPoint, setUserStartingPoint] = useState<string | null>(
    null
  );
  // const [contentStartingPoint, setContentStartingPoint] = useState<
  //   string | null
  // >(null);

  const [numberOfContentsToDisplay, setNumberOfContentsToDisplay] = useState(5);

  const [fetching, setFetching] = useState(false);

  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------

  // Fetch both user data and content data on first page load.
  useEffect(() => {
    if (userSearchResults) {
      setUsersReturned(userSearchResults);
    } else if (param) {
      fetchUserData();
    }

    if (contentSearchResults) {
      setContentReturned(contentSearchResults);
    } else if (param) {
      fetchContentData();
    }
  }, [userSearchResults, contentSearchResults, param]);

  /**
   * fetchUserData() -> void
   *
   * @description
   *Send a get request to the api endpoint for searching for users.
   *
   * @returns void
   */
  const fetchUserData = async () => {
    if (!param) {
      return;
    }

    if (fetching) {
      alert("Already Fetching!!!!");
      return;
    }
    setFetching(true);

    try {
      const response = await axios.get(`${apiURL}/search/users/`, {
        params: {
          searchText: param,
          userStartingPoint: userStartingPoint,
        },
      });

      const newDocuments = response.data.documents;
      // Create a set to easily check if the last query has duplicates
      const usersSet = new Set(usersReturned.map((doc: User) => doc.uid));
      // Create a get each user document id from the GET response, then check
      // for whether at least one is not in the stored user set.
      const uniqueDocuments = newDocuments.filter(
        (doc: { uid: string }) => !usersSet.has(doc.uid)
      );

      // If there are unique documents, update the state
      if (uniqueDocuments.length > 0 && !fetching) {
        setUsersReturned((prev) => [...prev, ...uniqueDocuments]);
        // Update the starting point for the next fetch
        setUserStartingPoint(
          uniqueDocuments[uniqueDocuments.length - 1].usernameLower
        );

        if (usersReturned.length < 5) {
          setUserDisabled(true);
        } else {
          setUserDisabled(false);
        }
      } else {
        // If there are no unique documents, disable the button
        setUserDisabled(true);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      setFetching(false);
    }
  };

  /**
   * fetchUserData() -> void
   *
   * @description
   *Send a get request to the api endpoint for searching for articles.
   *
   * @returns void
   */
  const fetchContentData = async () => {
    if (!param || fetching) {
      return;
    }

    setFetching(true);

    try {
      const response = await axios.get(`${apiURL}/search/content/`, {
        params: {
          searchText: param,
        },
      });

      // Obtain the documents from the response data.
      const newDocuments = response.data.documents;
      // Create a set to easily check if the last query has duplicates
      const contentSet = new Set(
        contentReturned.map((doc: Content) => doc.uid)
      );
      // Get each document id from the GET response, then check
      // for whether at least one is not in the stored content set.
      const uniqueDocuments = newDocuments.filter(
        (doc: { id: string }) => !contentSet.has(doc.id)
      );

      // If there are unique documents, update the state
      if (uniqueDocuments.length > 0 && !fetching) {
        // Append the new data to the list of stored articles.
        setContentReturned((prev) => [...prev, ...uniqueDocuments]);
        // Update the starting point for the next fetch.
        // setContentStartingPoint(
        //   uniqueDocuments[uniqueDocuments.length - 1].titleLower
        // );
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      setFetching(false);
    }
  };

  return (
    <>
      {/* <div className='main-content'> */}
      <div className='searchResults'>
        {param && <h1>Search Results for: {param}</h1>}
        <h2>Users</h2>
        {usersReturned?.length === 0 ? (
          <p>Nothing found...</p>
        ) : (
          usersReturned.map((user: User, index) => (
            <div key={index} className='searchItem'>
              <UserSearchResults user={user} />
            </div>
          ))
        )}
        {!userDisabled && (
          <button className='fetchMoreButton' onClick={fetchUserData}>
            Fetch more items
          </button>
        )}

        <h2>Content</h2>

        {contentReturned?.length === 0 ? (
          <p>Nothing found...</p>
        ) : (
          contentReturned.map(
            (content: Content, index) =>
              index < numberOfContentsToDisplay && (
                <div key={index} className='searchItem'>
                  <ContentSearchResult content={content} />
                </div>
              )
          )
        )}

        {contentSearchResults &&
          contentSearchResults.length > numberOfContentsToDisplay && (
            <button
              className='fetchMoreButton'
              onClick={() =>
                setNumberOfContentsToDisplay(numberOfContentsToDisplay + 5)
              }
            >
              Fetch more Content
            </button>
          )}
      </div>
      {/* </div> */}
    </>
  );
}

const SearchList = (props: {
  userSearchResults?: User[];
  contentSearchResults?: Content[];
}) => {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchListContent {...props} />
    </Suspense>
  );
};

export default SearchList;
