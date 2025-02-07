import { calculateTimePillar, heavenlyStems } from "../utils/saJuCalculator";

export default function TimeSelector({ time, setTime, setTimePillar, dayPillar }) {
  const handleTimeChange = (e) => {
    const inputTime = e.target.value;
    setTime(inputTime);
    const numTime = parseInt(inputTime);
    if (numTime >= 0 && numTime <= 23 && dayPillar) {
      // dayPillar의 첫 글자(천간)를 추출하여 해당 인덱스를 구함
      const dayStem = dayPillar.stem;
      const dayStemIndex = heavenlyStems.indexOf(dayStem);
      const result = calculateTimePillar(dayStemIndex, numTime);
      setTimePillar(result);
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">출생 시간 입력</label>
      <input
        type="number"
        min="0"
        max="23"
        value={time}
        onChange={handleTimeChange}
        className="p-2 border rounded w-full"
        placeholder="0 ~ 23 (24시간 기준)"
      />
    </div>
  );
}