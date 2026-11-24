export const PRINT_DPI = 600;

const LIMITS = {
    cm: { min: 0.5, max: 10, step: 0.1, presets: [1.5, 1.8, 2, 3] },
    px: { min: 200, max: 4000, step: 50, presets: [500, 1000, 2000] }
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

// Ukuran file PNG dalam piksel untuk ukuran yang dipilih
export const qrPixels = ({ unit, value }) => {
    const { min, max } = LIMITS[unit];
    const v = clamp(parseFloat(value) || min, min, max);
    return unit === 'cm' ? Math.max(Math.round((v / 2.54) * PRINT_DPI), 100) : Math.round(v);
};

export default function QrSizeControl({ size, onChange }) {
    const { unit, value } = size;
    const lim = LIMITS[unit];
    const numeric = clamp(parseFloat(value) || lim.min, lim.min, lim.max);

    const switchUnit = (next) => {
        if (next === unit) return;
        onChange({ unit: next, value: next === 'cm' ? 2 : 1000 });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-1 gap-2">
                <label className="text-xs text-gray-400 font-medium">Ukuran PNG</label>
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        min={lim.min}
                        max={lim.max}
                        step={lim.step}
                        value={value}
                        onChange={(e) => onChange({ unit, value: e.target.value })}
                        className="w-20 px-2 py-1 text-xs text-right bg-white/5 border border-white/10 rounded-md outline-none focus:border-white/30"
                    />
                    <select
                        value={unit}
                        onChange={(e) => switchUnit(e.target.value)}
                        className="px-1 py-1 text-xs bg-white/5 border border-white/10 rounded-md outline-none"
                    >
                        <option value="cm" className="text-black">cm</option>
                        <option value="px" className="text-black">px</option>
                    </select>
                </div>
            </div>
            <input
                type="range"
                min={lim.min}
                max={lim.max}
                step={lim.step}
                value={numeric}
                onChange={(e) => onChange({ unit, value: e.target.value })}
                className="w-full"
            />
            <div className="flex gap-2 mt-2">
                {lim.presets.map(p => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange({ unit, value: p })}
                        className={`flex-1 py-1 text-xs rounded-md border transition-colors ${Number(value) === p ? 'border-white/40 text-white bg-white/10' : 'border-white/10 text-gray-400 hover:text-white'}`}
                    >
                        {p} {unit}
                    </button>
                ))}
            </div>
            {unit === 'cm' && (
                <p className="text-[10px] text-gray-500 mt-2">
                    PNG dibuat {PRINT_DPI} dpi dengan ukuran cetak {numeric} × {numeric} cm. Saat ditempel di Word/PDF, ukuran otomatis pas.
                </p>
            )}
        </div>
    );
}
