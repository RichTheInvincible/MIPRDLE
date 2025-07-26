import React, { useEffect, useState } from 'react';
import { loadCSV } from '../utils/CSVLoader';
import { selectAnswer } from '../utils/AnswerSelector';
import type { PlayerRow } from '../utils/CSVLoader';

export default function TestLoader() {
    const [answer, setAnswer] = useState<PlayerRow | null>(null);

    useEffect(() => {
        loadCSV('/Data - Data.csv').then(rows => {
            const todayAnswer = selectAnswer(rows);
            setAnswer(todayAnswer);
        });
    }, []);

    return (
        <div>
            <h2>Today's Answer</h2>
            {answer ? (
                <pre>{JSON.stringify(answer, null, 2)}</pre>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}