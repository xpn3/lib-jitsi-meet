/* global __filename, module */
import { getLogger } from 'jitsi-meet-logger';

const logger = getLogger(__filename);

export default class JitsiSchismingHub {
    /**
     * JitsiSchismingHub constructor
     */
    constructor(conference) {
        this._schismingGroupByParticipantJid = {};
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
        this._schismingGroupByParticipantJid = this._parseStateXml(newState);
        logger.info('Replaced state of JitsiSchismingHub');
    }

    _parseStateXml(schismingHubState) {
        var groupByParticipantJid = {};
        const groups = schismingHubState.getElementsByTagName('group');

        for(var i = 0; i < groups.length; i++) {
        	logger.info('group id =' + groups[i].getAttribute('id'));
            var participants = groups[i].getElementsByTagName('participant');
            for(var j = 0; j < participants.length; j++) {
            	logger.info('participant id = ' + participants[j].getAttribute('id'));
            	groupByParticipantJid[participants[j].getAttribute('id')] = groups[i].getAttribute('id');
            }
        }
        return groupByParticipantJid;
    }

    /**
     * Gets the participants that are in other schisming groups than the participant with thisParticipantJid.
     * @param thisParticipantJid {Jid} The Jid of the participant executing this function.
     * @param otherParticipants {Array<JitsiParticipant>} Array of other participants in this conference.
     * @returns {Array<JitsiParticipant>} Participants that are in different schisming groups than the participant with thisParticipantJid.
     */
    getParticipantsOfOtherSchismingGroups(thisParticipantJid, otherParticipants) {
        if(!this._getSchismingGroupIdForParticipant) {
            return;
        }

        var thisGroupId = this._getSchismingGroupIdForParticipant(thisParticipantJid);
        logger.info('Schisming group id for caller: ' + thisGroupId);
        var participantsOfOtherSchismingGroups = [];

        for(var i = 0; i < otherParticipants.length; i++) {
            var participantGroupId = this._getSchismingGroupIdForParticipant(otherParticipants[i].getJid());
            if(participantGroupId != thisGroupId) {
                participantsOfOtherSchismingGroups.push(otherParticipants[i]);
            }
        }
        return participantsOfOtherSchismingGroups;
    }

    _getSchismingGroupIdForParticipant(participantJid) {
        return this._schismingGroupByParticipantJid[participantJid];
    }
}