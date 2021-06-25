/* global __filename, module */
import { getLogger } from 'jitsi-meet-logger';

const logger = getLogger(__filename);

export default class JitsiSchismingHub {
    /**
     * JitsiSchismingHub constructor
     */
    constructor(conference) {
        this._schismingGroupByParticipantId = {};

        this.replaceState = this.replaceState.bind(this);
        this._parseStateXml = this._parseStateXml.bind(this);
        this.getParticipantsByGroupIds = this.getParticipantsByGroupIds.bind(this);
        this.getParticipantsOfOtherSchismingGroups = this.getParticipantsOfOtherSchismingGroups.bind(this);
        this.getSchismingGroupIdForParticipant = this.getSchismingGroupIdForParticipant.bind(this);
        this._hasParticipants = this._hasParticipants.bind(this);
    }

    /**
     * Replaces current state of JitsiSchismingHub with a new state.
     * @param newState {HTMLCollection} State in the form of:
     *        <schisminghub>
     *            <group id='1'>
     *                <participant id='room1@example.com/alicesId'></participant>
     *            </group>
     *            <group id='2'>
     *                <participant id='room1@example.com/bobsId'></participant>
     *                <participant id='room1@example.com/charliesId'></participant>
     *            </group>
     *        </schisminghub>
     */
    replaceState(newState) {
        if(!newState) {
            return;
        }
        this._schismingGroupByParticipantId = this._parseStateXml(newState);
        logger.info('Replaced state of JitsiSchismingHub');
    }

    _parseStateXml(schismingHubState) {
        var groupByParticipantId = {};
        const groups = schismingHubState.getElementsByTagName('group');

        for(var i = 0; i < groups.length; i++) {
        	logger.info('group id =' + groups[i].getAttribute('id'));
            var participants = groups[i].getElementsByTagName('participant');
            for(var j = 0; j < participants.length; j++) {
            	logger.info('participant id = ' + participants[j].getAttribute('id'));
            	groupByParticipantId[participants[j].getAttribute('id')] = groups[i].getAttribute('id');
            }
        }
        return groupByParticipantId;
    }

    getParticipantsByGroupIds(allParticipants) {
        var participantsByGroupIds = {};
        if(!this._hasParticipants()) {
            return participantsByGroupIds;
        }

        for(var i = 0; i < allParticipants.length; i++) {
            var participant = allParticipants[i];
            var groupId = this.getSchismingGroupIdForParticipant(participant.getId());
            if(participantsByGroupIds[groupId] == null) {
                participantsByGroupIds[groupId] = [];
            }
            logger.info('Adds participant (id=' + participant.getId() + ' and groupId=' + groupId + ') to participantsByGroupIds.');
            participantsByGroupIds[groupId].push(allParticipants[i]);
        }
        return participantsByGroupIds;
    }

    /**
     * Gets the participants that are in other schisming groups than the participant with thisParticipantId.
     * @param thisParticipantId {Id} The Id of the participant executing this function.
     * @param otherParticipants {Array<JitsiParticipant>} Array of other participants in this conference.
     * @returns {Array<JitsiParticipant>} Participants that are in different schisming groups than the participant with thisParticipantJid.
     */
    getParticipantsOfOtherSchismingGroups(thisParticipantId, otherParticipants) {
        var participantsOfOtherSchismingGroups = [];
        if(!this._hasParticipants()) {
            return participantsOfOtherSchismingGroups;
        }

        var thisGroupId = this.getSchismingGroupIdForParticipant(thisParticipantId);
        logger.info('Schisming group id for caller: ' + thisGroupId);

        for(var i = 0; i < otherParticipants.length; i++) {
            var participantGroupId = this.getSchismingGroupIdForParticipant(otherParticipants[i].getId());
            if(participantGroupId != thisGroupId) {
                participantsOfOtherSchismingGroups.push(otherParticipants[i]);
            }
        }
        return participantsOfOtherSchismingGroups;
    }

    getSchismingGroupIdForParticipant(participantId) {
        return this._schismingGroupByParticipantId[participantId];
    }

    _hasParticipants() {
        return Object.keys(this._schismingGroupByParticipantId).length > 0;
    }
}