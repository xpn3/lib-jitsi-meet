/* global __filename, module */
import { getLogger } from 'jitsi-meet-logger';

const logger = getLogger(__filename);

export default class JitsiSchismingHub {
    /**
     * JitsiSchismingHub constructor
     */
    constructor(conference) {
        this._schismingGroupByParticipantJid = {};

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

    getParticipantsByGroupIds(allParticipants) {
        logger.info('>>> reached getParticipantsByGroupIds');
        var participantsByGroupIds = {};
        if(!this._hasParticipants()) {
            return participantsByGroupIds;
        }

        for(var i = 0; i < allParticipants.length; i++) {
            logger.info('>>> reached start for with i ' + i);
            var participant = allParticipants[i];
            var groupId = this.getSchismingGroupIdForParticipant(participant.getJid());
            if(participantsByGroupIds[groupId] == null) {
                logger.info('>>> reached participantsByGroupIds(groupId) == undefined');
                participantsByGroupIds[groupId] = [];
            }
            logger.info('>>> reached bfore participantsByGroupIds(groupId).push(allParticipants[i])');
            participantsByGroupIds[groupId].push(allParticipants[i]);
            logger.info('>>> reached end for with i ' + i);
        }
        logger.info('>>> reached before return participantsByGroupIds');
        return participantsByGroupIds;
    }

    /**
     * Gets the participants that are in other schisming groups than the participant with thisParticipantJid.
     * @param thisParticipantJid {Jid} The Jid of the participant executing this function.
     * @param otherParticipants {Array<JitsiParticipant>} Array of other participants in this conference.
     * @returns {Array<JitsiParticipant>} Participants that are in different schisming groups than the participant with thisParticipantJid.
     */
    getParticipantsOfOtherSchismingGroups(thisParticipantJid, otherParticipants) {
        var participantsOfOtherSchismingGroups = [];
        if(!this._hasParticipants()) {
            return participantsOfOtherSchismingGroups;
        }

        var thisGroupId = this.getSchismingGroupIdForParticipant(thisParticipantJid);
        logger.info('Schisming group id for caller: ' + thisGroupId);

        for(var i = 0; i < otherParticipants.length; i++) {
            var participantGroupId = this.getSchismingGroupIdForParticipant(otherParticipants[i].getJid());
            if(participantGroupId != thisGroupId) {
                participantsOfOtherSchismingGroups.push(otherParticipants[i]);
            }
        }
        return participantsOfOtherSchismingGroups;
    }

    getSchismingGroupIdForParticipant(participantJid) {
        return this._schismingGroupByParticipantJid[participantJid];
    }

    _hasParticipants() {
        return Object.keys(this._schismingGroupByParticipantJid).length > 0;
    }
}