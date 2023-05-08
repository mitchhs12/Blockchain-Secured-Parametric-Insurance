import React, { useState } from "react";
import { addDays, format } from "date-fns";
import { DateRange, DayPicker } from "react-day-picker";

const css = `
  .my-selected:not([disabled]) { 
    font-weight: bold; 
    border: 2px solid currentColor;
  }

  .my-selected:hover:not([disabled]) { 
    border-color: blue;
    color: blue;
  }

  .my-today { 
    font-weight: bold;
    font-size: 150%; 
    color: green;
  }
`;

const Calendar = () => {
    const pastMonth = new Date();

    const defaultSelected = {
        from: addDays(pastMonth, 7),
        to: addDays(pastMonth, 14),
    };

    const [range, setRange] = useState(defaultSelected);

    let footer = <p>Please pick the first day.</p>;
    if (range?.from) {
        if (!range.to) {
            footer = <p>{format(range.from, "PPP")}</p>;
        } else if (range.to) {
            footer = (
                <p className="pt-4">
                    {format(range.from, "PPP")} – {format(range.to, "PPP")}
                </p>
            );
        }
    }

    return (
        <>
            <style>{css}</style>
            <DayPicker
                id="calendar"
                mode="range"
                styles={{ caption: { color: "white" } }}
                defaultMonth={pastMonth}
                selected={range}
                footer={footer}
                modifiersClassNames={{
                    selected: "my-selected",
                    today: "my-today",
                }}
                modifiersStyles={{
                    disabled: { fontSize: "75%" },
                }}
                onSelect={setRange}
            />
        </>
    );
};
export default Calendar;
