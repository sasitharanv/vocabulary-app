export async function lookupWord(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Word "${word}" not found in dictionary`);
        }
        const data = await response.json();
        if (!data || data.length === 0) {
            throw new Error(`Word "${word}" not found in dictionary`);
        }
        const entry = data[0];
        // Find the first meaning with definitions
        for (const meaning of entry.meanings) {
            if (meaning.definitions && meaning.definitions.length > 0) {
                const def = meaning.definitions[0];
                const definition = def.definition || '';
                const example = def.example || `(Example not available for "${word}")`;
                return {
                    word: entry.word,
                    definition,
                    example,
                };
            }
        }
        throw new Error(`No definition found for "${word}"`);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error(`Failed to lookup "${word}"`);
    }
}
