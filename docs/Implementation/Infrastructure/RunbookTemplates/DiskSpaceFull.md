# Runbook: Disk Space Full

## Incident Type: Disk Space Full

## Description:
This runbook provides steps to resolve a disk space full incident on a server.

## Symptoms:
*   Monitoring alerts indicate low disk space.
*   Applications are unable to write data to disk.
*   System crashes or instability.

## Impact:
*   Service degradation or unavailability.
*   Data loss.

## Prerequisites:
*   Access to the server infrastructure.
*   Credentials for relevant monitoring tools.

## Procedure:
1.  Identify the disk partition that is full using monitoring tools.
2.  Identify the files or directories consuming the most disk space.
3.  Remove unnecessary files, such as temporary files, log files, or old backups.
4.  Archive or compress large files that are not frequently accessed.
5.  Consider increasing the size of the disk partition if the disk space full issue is recurring.
6.  Escalate to the appropriate team if the issue cannot be resolved.

## Rollback Plan:
*   If removing files causes issues, restore them from backup.
*   If disk resizing causes instability, revert to the previous disk size.

## Escalation:
*   If the disk space full issue persists for more than 15 minutes, escalate to the on-call engineer.

## Automation Potential:
*   Automated disk space monitoring and cleanup.

## Related Documentation:
*   Server Configuration Guide
*   Troubleshooting Guide

## Version History:
*   v1.0 - Initial version