import Image from "next/image";

function StartGameButton() {
  return <a
    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
    href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Image
      className="dark:invert"
      src="/vercel.svg"
      alt="Vercel logomark"
      width={20}
      height={20}
    />
    Start a new game
  </a>;
}

export default StartGameButton 