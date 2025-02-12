import { calculateTimePillar } from "../utils/pillarCalculator";
import { heavenMapping } from '../constants/mappings';

export default function TimeSelector({ time, setTime, setTimePillar, dayPillar }) {
  const handleTimeChange = (e) => {
    const inputTime = e.target.value;
    const [hour, minute] = inputTime.split(":").map(Number);
    const hourTime = parseInt(hour);
    setTime(inputTime);

    if (hourTime >= 0 && hourTime <= 23 && dayPillar) {
      // dayPillar의 천간을 가져와서 해당 인덱스를 찾음
      const dayStem = dayPillar.stem;
      const dayStemIndex = Object.values(heavenMapping).indexOf(dayStem);

      if (dayStemIndex !== -1) {
        const result = calculateTimePillar(dayStemIndex, hourTime);
        setTimePillar(result);
      }
    }
  };

  return (
    <div className="w-full mb-4">
      <label className="block mb-1 font-medium">출생 시간 입력</label>
      <input
        type="time"
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
