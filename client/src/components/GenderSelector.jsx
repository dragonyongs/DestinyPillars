export default function GenderSelector({ gender, setGender }) {

    const handleGenderChange = (e) => {
        const genderInput = e.target.value;
        setGender(genderInput);

        console.log('genderInput', genderInput);
    }
    return (
        <div className="w-full mb-4">
            <label className="block mb-1 font-medium">성별 선택</label>
            <select
                value={gender}
                onChange={handleGenderChange}
                className="p-2 border rounded w-full"
            >
                <option value="">선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
            </select>
        </div>
    );
}
