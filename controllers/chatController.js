const fetch = require('node-fetch');
require('dotenv').config();

const home = (req, res) => {
    res.render('index', { response: '', userInput: '', user: req.session?.user || null });
};

const chatController = async (req, res) => {
    const { userInput } = req.body;

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

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        console.error('Missing API Key. Check .env file.');
        return res.render('index', {
            response: 'Server configuration issue. Please try again later.',
            userInput,
            user: req.session?.user || null,
        });
    }

    const url = 'https://chatgpt-42.p.rapidapi.com/gpt4';
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
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

        console.log('API Response:', result);

        if (!response.ok || !result.result) {
            console.error('API Error:', result);
            return res.render('index', {
                response: 'Failed to get a valid response from the AI. Please try again later.',
                userInput,
                user: req.session?.user || null,
            });
        }

        const formattedResponse = result.result
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/###\s(.*?)<br>/g, '<h3>$1</h3>')
            .replace(/####\s(.*?)<br>/g, '<h4>$1</h4>')
            .replace(/<li>(.*?)<br>/g, '<li>$1</li>')
            .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>')
            .replace(/<\/ul><ul>/g, '')
            .replace(/\n/g, '<br>');

        res.render('index', {
            response: formattedResponse,
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