export default function StarRatingInput({ value, onChange }) {
  return (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={star <= value ? 'star filled' : 'star'}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
