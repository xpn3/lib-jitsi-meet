const SchismingEvents = {
    /**
     * Indicates that the state of the SchismingHub has been updated.
     * Emitted by the ChatRoom after an incoming SchismingIq from Jicofo.
     */
    HUB_STATE_RECEIVED: 'schisming.hub_state_received'
};

module.exports = SchismingEvents;