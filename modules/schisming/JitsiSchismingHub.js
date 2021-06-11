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

    _setTestState(thisParticipantJid, otherParticipants) {
        this._schismingGroupByParticipantJid[thisParticipantJid] = '1';
        if(otherParticipants.length >= 1) {
            this._schismingGroupByParticipantJid[otherParticipants[0].getJid()] = '2';
        }
        if(otherParticipants.length >= 2) {
            this._schismingGroupByParticipantJid[otherParticipants[1].getJid()] = '1';
        }
        if(otherParticipants.length >= 3) {
            this._schismingGroupByParticipantJid[otherParticipants[2].getJid()] = '2';
        }
    }

    /**
     * Gets the participants that are in other schisming groups than the participant with thisParticipantJid.
     * @param thisParticipantJid {Jid} The Jid of the participant executing this function.
     * @param otherParticipants {Array<JitsiParticipant>} Array of other participants in this conference.
     * @returns {Array<JitsiParticipant>} Participants that are in different schisming groups than the participant with thisParticipantJid.
     */
    getParticipantsOfOtherSchismingGroups(thisParticipantJid, otherParticipants) {
        this._setTestState(thisParticipantJid, otherParticipants); // TODO remove as soon as Jicofo is able to send SchismingHub

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