interface PromoBannerProps {
  banner: {
    text: string;
    backgroundColor: string;
    textColor: string;
    link?: string;
  };
}

const PromoBanner = ({ banner }: PromoBannerProps) => {
  const { text, backgroundColor, textColor, link } = banner;

  const content = (
    <div
      className="w-full py-2 px-4 text-center text-sm font-medium"
      style={{
        backgroundColor: backgroundColor.includes("hsl")
          ? `hsl(${backgroundColor})`
          : backgroundColor,
        color: textColor.includes("hsl") ? `hsl(${textColor})` : textColor,
      }}
    >
      {text}
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
};

export default PromoBanner;
