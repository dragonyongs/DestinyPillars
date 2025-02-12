import { heavenMapping } from '../constants/mappings';

export default function YearSelector({ year, setYear, setYearStemIndex }) {
  const handleYearChange = (e) => {
    const inputYear = e.target.value;
    setYear(inputYear);
    const numYear = parseInt(inputYear);
    
    if (numYear) {
      const stemIndex = (numYear - 4) % 10;
      const stem = Object.values(heavenMapping)[stemIndex]; // 천간 값 가져오기

      setYearStemIndex(stemIndex); // 인덱스를 저장
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">출생 연도 입력</label>
      <input
        type="number"
        value={year}
        onChange={handleYearChange}
        className="p-2 border rounded w-full"
        placeholder="연도 입력"
      />
    </div>
  );
}
