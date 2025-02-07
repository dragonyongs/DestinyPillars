import { calculateMonthPillar } from "../utils/saJuCalculator";

export default function MonthSelector({ month, setMonth, setMonthPillar, yearStemIndex }) {
  const handleMonthChange = (e) => {
    const inputMonth = e.target.value;
    setMonth(inputMonth);
    const numMonth = parseInt(inputMonth);
    if (numMonth >= 1 && numMonth <= 12 && yearStemIndex !== null) {
      const result = calculateMonthPillar(yearStemIndex, numMonth);
      setMonthPillar(result);
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">출생 월 입력</label>
      <input
        type="number"
        min="1"
        max="12"
        value={month}
        onChange={handleMonthChange}
        className="p-2 border rounded w-full"
        placeholder="1 ~ 12"
      />
    </div>
  );
}