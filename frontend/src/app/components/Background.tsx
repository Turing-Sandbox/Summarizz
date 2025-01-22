import "../styles/background.scss";

/**
 * Background() -> JSX.Element
 * 
 * @description
 * Renders the background for the website, consisting of a series of designs that
 * make it popout and better to look at.
 * 
 * @returns JSX.Element (Background)
 */
export default function Background() {
  return (
    <div className='background-shapes'>
      <div className='left-bottom-rectangle' />
      <div className='left-top-rectangle' />
      <div className='middle-bottom-circle' />
      <div className='right-top-circle' />
    </div>
  );
}
