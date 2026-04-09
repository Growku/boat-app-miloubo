"use client";

interface JerryCanProps {
  fuel: {
    jerry_cans_full: number;
    jerry_cans_empty: number;
  };
}

export default function JerryCans({ fuel }: JerryCanProps) {
  const fullCans = fuel.jerry_cans_full;
  const emptyCans = fuel.jerry_cans_empty;
  const totalCans = fullCans + emptyCans;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Jerry Cans
      </h3>

      {totalCans === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No cans tracked yet</p>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center mb-3">
          {Array.from({ length: fullCans }).map((_, i) => (
            <div key={`full-${i}`} className="flex flex-col items-center">
              <div className="w-10 h-14 rounded-lg bg-green-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 4h-3V2h-4v2H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H7V6h10v14z" />
                </svg>
              </div>
              <span className="text-[10px] text-green-600 font-medium mt-1">Full</span>
            </div>
          ))}
          {Array.from({ length: emptyCans }).map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center">
              <div className="w-10 h-14 rounded-lg bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 4h-3V2h-4v2H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H7V6h10v14z" />
                </svg>
              </div>
              <span className="text-[10px] text-gray-400 font-medium mt-1">Empty</span>
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-gray-600">
        <span className="font-semibold text-green-600">{fullCans}</span> full,{" "}
        <span className="font-semibold text-gray-400">{emptyCans}</span> empty
      </div>
    </div>
  );
}
