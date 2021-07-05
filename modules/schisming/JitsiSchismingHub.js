/* global __filename, module */
import { getLogger } from 'jitsi-meet-logger';

import * as JitsiConferenceEvents from '../../JitsiConferenceEvents';
import { $iq, Strophe } from 'strophe.js';

const logger = getLogger(__filename);

export default class JitsiSchismingHub {
    /**
     * JitsiSchismingHub constructor
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this._schismingGroupByParticipantId = {};

        this._parseStateXml = this._parseStateXml.bind(this);
        this._hasParticipants = this._hasParticipants.bind(this);

        this.replaceState = this.replaceState.bind(this);
        this.getParticipantIdsByGroupId = this.getParticipantIdsByGroupId.bind(this);
        this.getParticipantIdsOfOtherSchismingGroups = this.getParticipantIdsOfOtherSchismingGroups.bind(this);
        this.getSchismingGroupIdForParticipant = this.getSchismingGroupIdForParticipant.bind(this);
        this.joinOrLeaveGroup = this.joinOrLeaveGroup.bind(this);
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
    replaceState(connection, from, to, newState) {
        if(!newState) {
            return;
        }

        this._connection = connection;
        this._mucJid = from;
        this._myRoomJid = to;

        this._schismingGroupByParticipantId = this._parseStateXml(newState);
        logger.info('Replaced state of JitsiSchismingHub');
        this.eventEmitter.emit(JitsiConferenceEvents.SCHISMINGHUB_STATE_CHANGED);
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

    getParticipantIdsByGroupId() {
        var participantIdsByGroupId = {};

        for(const [participantId, groupId] of Object.entries(this._schismingGroupByParticipantId)) {
            if(participantIdsByGroupId[groupId] == null) {
                participantIdsByGroupId[groupId] = [];
            }
            logger.info('Adds participant (id=' + participantId + ' and groupId=' + groupId + ') to participantIdsByGroupId.');
            participantIdsByGroupId[groupId].push(participantId);
        }

        return participantIdsByGroupId;
    }

    /**
     * Gets the participants that are in other schisming groups than the participant with thisParticipantId.
     * @param thisParticipantId {String} The Id of the participant executing this function.
     * @returns {Array<String>} Ids of participants that are in different schisming groups than the participant with thisParticipantJid.
     */
    getParticipantIdsOfOtherSchismingGroups(thisParticipantId) {
        var participantIdsOfOtherSchismingGroups = [];
        if(!this._hasParticipants()) {
            return participantIdsOfOtherSchismingGroups;
        }

        var thisGroupId = this.getSchismingGroupIdForParticipant(thisParticipantId);
        logger.info('Schisming group id for caller: ' + thisGroupId);

        for(const [participantId, groupId] of Object.entries(this._schismingGroupByParticipantId)) {
            if(groupId != thisGroupId) {
                logger.info('Adding participant (' + participantId + ', ' + groupId + ') to participantIdsOfOtherSchismingGroups');
                participantIdsOfOtherSchismingGroups.push(participantId);
            }
        }

        return participantIdsOfOtherSchismingGroups;
    }

    getSchismingGroupIdForParticipant(participantId) {
        return this._schismingGroupByParticipantId[participantId];
    }

    _hasParticipants() {
        return Object.keys(this._schismingGroupByParticipantId).length > 0;
    }

    /**
     * Joins a SchismingGroup thereby creating and sending a SchismingJoinIq to jicofo.
     * @param participantId {Id} The Id of the participant that joins.
     * @param groupId {Integer} The Id of the SchismingGroup that the participant wants to join (to leave a group, set groupId=null).
     */
    joinOrLeaveGroup(participantId, groupId) {
        logger.info('Calling joinOrLeaveGroup with participantId=' + participantId + ', groupId=' + groupId);

        if(this._connection == null) {
            logger.warn('Did not send SchismingJoinIq due to missing connection.');
            return;
        }
        if(this._myRoomJid == null) {
            logger.warn('Did not send SchismingJoinIq due to missing Jid of local participant.');
            return;
        }
        if(this._mucJid == null) {
            logger.warn('Did not send SchismingJoinIq due to missing MUC Jid.');
            return;
        }

        const schismingJoinIq = $iq({to: this._mucJid, from: this._myRoomJid, type: 'set'})
            .c('join', {xmlns: 'http://jitsi.org/jitmeet/schisming', participantId: participantId, groupId: groupId});

        logger.info('Sending SchismingJoinIq: ' + schismingJoinIq.toString());

        this._connection.sendIQ(
            schismingJoinIq,
            result => logger.info('Successfully sent IQ to join or leave SchismingGroup.'),
            error => logger.error('Error sending IQ to join or leave SchismingGroup: ', error)
        );
    }
}