import { useState } from "react";
import PropTypes from "prop-types";

const containerStyle = { display: "flex", alignItems: "center", gap: "8px" };
const starContainerStyle = { display: "flex" };

StarRating.propTypes = {
  maxRating: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  messages: PropTypes.array,
  defaultRating: PropTypes.number,
  onSetRating: PropTypes.func,
};

export default function StarRating({
  maxRating = 5,
  color = "#fcc419",
  size = 48,
  className = "",
  messages = [],
  defaultRating = 0,
  onSetRating = "",
}) {
  const [rating, setRating] = useState(defaultRating);
  const [hoverRating, setHoverRating] = useState(0);
  const contentStyle = {
    lineHeight: "1",
    margin: "0",
    color: color,
    fontSize: `${size * 0.66}px`,
  };

  function handleSetRating(pos) {
    if (pos === rating) {
      setRating(0);
      onSetRating && onSetRating(0);
      return;
    }
    setRating(pos);
    onSetRating && onSetRating(pos);
  }

  return (
    <div style={containerStyle} className={className}>
      <div style={starContainerStyle}>
        {
          <Stars
            maxRating={maxRating}
            rating={rating}
            handleSetRating={handleSetRating}
            hoverRating={hoverRating}
            setHoverRating={setHoverRating}
            color={color}
            size={size}
          />
        }
      </div>
      <span style={contentStyle}>
        {messages.length === maxRating
          ? messages[hoverRating ? hoverRating - 1 : rating - 1]
          : hoverRating || rating || ""}
      </span>
    </div>
  );
}

function Stars({
  maxRating,
  rating,
  handleSetRating,
  hoverRating,
  setHoverRating,
  color,
  size,
}) {
  return (
    <>
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          full={i + 1 <= (hoverRating || rating)}
          pos={i + 1}
          key={i + 1}
          rating={rating}
          handleSetRating={handleSetRating}
          hoverRating={hoverRating}
          setHoverRating={setHoverRating}
          color={color}
          size={size}
        />
      ))}
    </>
  );
}

function Star({ pos, full, handleSetRating, setHoverRating, color, size }) {
  const starStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: "block",
    cursor: "pointer",
  };
  return (
    <span
      role="button"
      style={starStyle}
      onClick={() => handleSetRating(pos)}
      onMouseEnter={() => {
        setHoverRating(pos);
      }}
      onMouseLeave={() => {
        setHoverRating(0);
      }}
    >
      {full ? <FullStar color={color} /> : <EmptyStar color={color} />}
    </span>
  );
}

function FullStar({ color }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill={color}
      stroke={color}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function EmptyStar({ color }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke={color}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="{2}"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}
