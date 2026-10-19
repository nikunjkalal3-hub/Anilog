import { useState } from "react";

function Card({ name, role, image }) {
  const [showImage, setShowImage] = useState(false);
  return (
    <div className="card">
      <h2>{name}</h2>

      <button onClick={() => setShowImage(!showImage)}>
  {showImage ? "Hide Image" : "Show Image"}
</button>

<button onClick={()=> setShowImage(false)}>hide image</button>

{showImage && <img src={image} alt={name} />}
    </div>
  );
}

export default Card;