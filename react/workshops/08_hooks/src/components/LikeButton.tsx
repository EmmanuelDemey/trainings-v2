type LikeButtonProps = {
  name: string;
};

export function LikeButton({ name }: LikeButtonProps) {
  // TODO 5.1: count the likes in a state; "Like {name}" adds one. Display
  //           "1 like" / "2 likes" (and "0 likes").
  // TODO 5.2: "Super like" adds TWO — by calling the setter twice. Make it work.
  // TODO 5.3: after any like, show <span role="status" className="thanks">
  //           Thanks for liking {name}!</span> for 2 seconds. Keep the timer id
  //           in a `useRef`: a new like restarts the 2 seconds.
  // TODO 5.4: clear the pending timer when the component unmounts.
  const likes = 0;
  return (
    <div className="likes">
      <button type="button">Like {name}</button>
      <button type="button">Super like</button>
      <span>{likes} likes</span>
    </div>
  );
}
