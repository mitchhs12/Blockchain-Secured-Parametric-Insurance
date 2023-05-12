import React, { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { DayPicker } from "react-day-picker";

const css = `
    .my-today { 
        font-weight: bold;
        font-size: 150%; 
        color: yellow;
    }

    .my-selected:not([disabled]) { 
        font-weight: bold;
        color: orange
    }

    .my-selected:not([enabled]) {
        background-color: #242424;
        border-color: black;
    }

    .my-selected:hover:not([disabled]) { 
        border-color: grey;
        color: black;
    }

    .my-today:hover:not([disabled]){
        color: red
    }
`;

const Calendar = ({ fromDate, toDate, completed }) => {
    const pastMonth = new Date();
    const [range, setRange] = useState("Please select the first day");

    useEffect(() => {
        if (range?.from) {
            if (!range.to) {
                fromDate(<span>{format(range.from, "PPP")}</span>);
                completed(false);
            } else if (range.to) {
                fromDate(<span>{format(range.from, "PPP")}</span>);
                toDate(<span>{format(range.to, "PPP")}</span>);
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
                modifiersClassNames={{
                    selected: "my-selected",
                    today: "my-today",
                }}
                onSelect={setRange}
            />
        </>
    );
};
export default Calendar;
