import { Suspense, useEffect, useState } from "react";
import { User } from "../../models/User";
import { Content } from "../../models/Content";
import { useSearchParams } from "react-router-dom";
import ContentSearchResult from "./ContentSearchResult";
import UserSearchResults from "./UserSearchResult";
import { SearchService } from "../../services/SearchService";

function SearchListResults({
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
  const query = searchParams.get("query");

  const [usersReturned, setUsersReturned] = useState<User[]>([]);
  const [userDisabled, setUserDisabled] = useState(true);
  const [userStartingPoint, setUserStartingPoint] = useState<string | null>(
    null
  );

  const [contentReturned, setContentReturned] = useState<Content[]>([]);
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
    } else if (query) {
      fetchUserData();
    }

    if (contentSearchResults) {
      setContentReturned(contentSearchResults);
    } else if (query) {
      fetchContentData();
    }
  }, [userSearchResults, contentSearchResults, query]);

  /**
   * fetchUserData() -> void
   *
   * @description
   * Sends a GET request to the API endpoint for searching users.
   *
   * @returns void
   */
  const fetchUserData = async () => {
    if (!query) return;

    if (fetching) {
      alert("Already Fetching!");
      return;
    }

    setFetching(true);

    const userSearchResults = await SearchService.searchUsers(
      query,
      userStartingPoint
    );

    if (userSearchResults instanceof Error) {
      console.error("Error fetching user data:", userSearchResults);
      setFetching(false);
      return;
    }

    const users = userSearchResults.users || [];
    const existingUserIds = new Set(
      usersReturned.map((user: User) => user.uid)
    );

    // Filter out duplicate users
    const uniqueUsers = users.filter(
      (user: { uid: string }) => !existingUserIds.has(user.uid)
    );

    if (uniqueUsers && uniqueUsers.length > 0) {
      setUsersReturned((prev) => [...prev, ...uniqueUsers]);

      // Update the starting point for the next fetch
      setUserStartingPoint(
        uniqueUsers[uniqueUsers.length - 1]?.username.toLowerCase() || null
      );

      // Enable or disable the "Fetch more" button based on the number of users
      setUserDisabled(usersReturned.length + uniqueUsers.length < 5);
    } else {
      setUserDisabled(true); // Disable the button if no unique users are found
    }

    setFetching(false);
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
    if (!query) {
      return;
    }

    setFetching(true);

    const searchContentResults = await SearchService.searchContents(query);

    if (searchContentResults instanceof Error) {
      console.error("Error fetching content data:", searchContentResults);
      setFetching(false);
      return;
    }

    const contents = searchContentResults.contents || [];
    const existingContentIds = new Set(
      contentReturned.map((content: Content) => content.uid)
    );

    // Filter out duplicate users
    const uniqueContents = contents.filter(
      (content: { uid: string }) => !existingContentIds.has(content.uid)
    );

    if (uniqueContents && uniqueContents.length > 0) {
      setContentReturned((prev) => [...prev, ...uniqueContents]);
    } else {
      setUserDisabled(true); // Disable the button if no unique users are found
    }

    setFetching(false);
  };

  return (
    <>
      {/* <div className='main-content'> */}
      <div className='searchResults'>
        {query && <h1>Search Results for: {query}</h1>}
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
      <SearchListResults {...props} />
    </Suspense>
  );
};

export default SearchList;
