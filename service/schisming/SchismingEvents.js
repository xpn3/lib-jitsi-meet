const SchismingEvents = {
    /**
     * Indicates that the state of the SchismingHub has been updated.
     * Emitted by the ChatRoom after an incoming SchismingIq from Jicofo.
     */
    HUB_STATE_CHANGED: 'schisming.hub_state_changed'
};

module.exports = SchismingEvents;