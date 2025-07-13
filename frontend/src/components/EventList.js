import React from "react";
import { List, ListItem, ListItemText, IconButton, ListItemSecondaryAction } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import styles from "./EventList.module.css";

function EventList({ events, onEdit, onDelete }) {
  return (
    <List className={styles.list}>
      {events.map(event => (
        <ListItem key={event.id} divider className={styles.item}>
          <ListItemText
            primary={event.title}
            secondary={`${event.start} - ${event.end}`}
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="edit" onClick={() => onEdit(event)}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={() => onDelete(event)}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}

export default EventList; 