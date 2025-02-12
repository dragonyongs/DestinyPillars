import { calculateMonthPillar, calculateDayPillar } from "../utils/pillarCalculator";

export default function DateSelector({ birthDate, setBirthDate, setYearStemIndex, setMonthPillar, setDayPillar }) {
    const handleDateChange = (e) => {
        const inputDate = e.target.value;
        setBirthDate(inputDate);
    
        if (inputDate) {
            const [year, month, day] = inputDate.split("-").map(Number);
        
            // 연도 천간 인덱스 계산 및 설정
            if (year) {
                const stemIndex = (year - 4) % 10;
                setYearStemIndex(stemIndex);
            }
        
            // 월 기둥 계산 및 설정
            if (month && year) {
                const monthPillar = calculateMonthPillar((year - 4) % 10, month);
                setMonthPillar(monthPillar);
            }
        
            // 일 기둥 계산 및 설정
            if (day && month && year) {
                const dayPillar = calculateDayPillar(year, month, day);
                setDayPillar(dayPillar);
            }
        }
    };
    return (
    <div className="w-full mb-4">
        <label className="block mb-1 font-medium">출생 날짜 선택</label>
        <input
        type="date"
        value={birthDate}
        onChange={handleDateChange}
        className="p-2 border rounded w-full"
        />
    </div>
    );
}
