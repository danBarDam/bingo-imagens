export default function Imagem({ fonte, alt }) {
  return (
    <div className="img">
      {fonte.img ? (
        <img src={fonte.img} alt={alt} />
      ) : (
        <span className="emoji" role="img" aria-label={alt}>
          {fonte.emoji}
        </span>
      )}
    </div>
  );
}
