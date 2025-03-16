router.delete('/api/groq/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Delete the conversation from your database
        await Conversation.findByIdAndDelete(id);  // or your database deletion logic
        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});