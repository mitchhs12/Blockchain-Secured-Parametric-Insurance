import React, { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";

const css = `
    .rdp-day_selected:not([disabled]) { 
        font-weight: bold;
        color: orange
    }

    .rdp-day_selected:not([enabled]) {
        background-color: #242424;
        border-color: grey;
    }

    .rdp-day_selected:hover:not([disabled]) { 
        border-color: grey;
        color: orange;
    }

    .rdp-day_today,
    .rdp-day_today.rdp-day_selected,
    .rdp-day_today:hover:not([disabled]){
        color: yellow;
        font-weight: bold;
        font-size: 150%
    }

    .rdp-day:not(.rdp-day_selected):hover { 
        color: black;
        background-color: white;
        border-radius: 50%;
    }
`;

const Calendar = ({ fromDate, toDate, completed }) => {
    const pastMonth = new Date();
    const [range, setRange] = useState("Please select the first day");

    useEffect(() => {
        if (range?.from) {
            if (!range.to) {
                fromDate(range.from);
                completed(false);
            } else if (range.to) {
                fromDate(range.from);
                toDate(range.to);
                completed(true);
            }
        } else {
            fromDate("");
            toDate("");
            completed(false);
        }
    }, [range]);

    return (
        <>
            <style>{css}</style>
            <DayPicker
                id="calendar"
                mode="range"
                styles={{
                    caption: { color: "white" },
                }}
                defaultMonth={pastMonth}
                selected={range}
                onSelect={setRange}
            />
        </>
    );
};
export default Calendar;
