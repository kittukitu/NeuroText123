const fetch = require('node-fetch');
require('dotenv').config();

const home = (req, res) => {
    res.render('index', { response: '', userInput: '', user: req.session?.user || null });
};

const chatController = async (req, res) => {
    const { userInput } = req.body;

    // Input Validation
    if (!userInput || typeof userInput !== 'string' || userInput.trim() === '') {
        return res.render('index', {
            response: 'Please provide a valid input.',
            userInput,
            user: req.session?.user || null,
        });
    }

    if (userInput.length > 500) {
        return res.render('index', {
            response: 'Input is too long. Please limit to 500 characters.',
            userInput,
            user: req.session?.user || null,
        });
    }

    // Environment Variable Check
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        console.error('Missing API Key. Check .env file.');
        return res.render('index', {
            response: 'Server configuration issue. Please try again later.',
            userInput,
            user: req.session?.user || null,
        });
    }

    const url = 'https://chat-gpt26.p.rapidapi.com/';
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': apiKey,  // Using API key from .env
            'x-rapidapi-host': 'chat-gpt26.p.rapidapi.com',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: userInput.trim() }],
        }),
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        // Check if the API returned an actual response
        if (!response.ok || !result.choices || result.choices.length === 0) {
            console.error('API Error:', result);
            return res.render('index', {
                response: 'Failed to get a valid response from the AI. Please try again later.',
                userInput,
                user: req.session?.user || null,
            });
        }

        res.render('index', {
            response: result.choices[0].message.content,
            userInput,
            user: req.session?.user || null,
        });
    } catch (error) {
        console.error('Error fetching AI response:', error);
        res.render('index', {
            response: 'Error processing your request. Please try again later.',
            userInput,
            user: req.session?.user || null,
        });
    }
};

module.exports = { home, chatController };
