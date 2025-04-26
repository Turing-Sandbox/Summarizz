import { useNavigate } from "react-router-dom";
import { Content } from "../../models/Content";

export default function ContentSearchResult({ content }: { content: Content }) {
  const navigate = useNavigate();

  /**
   * handleClick() -> void
   *
   * @description
   * On a click, this redirects the user to the selected content's page.
   *
   * @returns void
   */
  const handleClick = () => {
    navigate(`/content/${content.uid}`);
  };

  return (
    <div className='contentSearchResults' onClick={handleClick}>
      <img
        src={content.thumbnail}
        alt={``}
        className='search-content-thumbnail'
      />
      <h3>{content.title}</h3>
    </div>
  );
}
