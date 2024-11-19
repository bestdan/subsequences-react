import Image from "next/image";

function MyButton() {
  return (
    <button className="mb-4 rounded border border-solid">
      Start a new game
    </button>
  );
}

<Image
  className="dark:invert"
  src="/next.svg"
  alt="Next.js logo"
  width={180}
  height={38}
  priority
/>
export default MyButton