import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import StarRating from "./StarRating";

// function Test() {
//   const [rating, setRating] = useState(0);
//   return (
//     <div>
//       <StarRating
//         maxRating={5}
//         color="blue"
//         size={35}
//         className="wassa"
//         messages={["Bad", "Baddy", "Goody", "Good", "Wow"]}
//         defaultRating={1}
//         onSetRating={setRating}
//       />
//       <p>This movie reated {rating}.</p>
//     </div>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
