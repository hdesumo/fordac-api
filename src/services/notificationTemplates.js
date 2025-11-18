// TEMPLATES DE NOTIFICATIONS POUR FORDAC ADMIN

module.exports = {
  // 📌 Lorsqu’un nouveau membre s’inscrit via le site
  NEW_MEMBER_REGISTERED: (member) => ({
    type: "membre",
    title: "Nouveau membre inscrit",
    message: `${member.name} vient de soumettre son adhésion.`,
    link: `/admin/membres/${member.id}`,
  }),

  // 📌 Lorsqu’un admin valide une adhésion
  MEMBER_APPROVED: (member) => ({
    type: "membre",
    title: "Adhésion approuvée",
    message: `${member.name} a été approuvé en tant que membre.`,
    link: `/admin/membres/${member.id}`,
  }),

  // 📌 Lorsqu’un membre est supprimé ou archivé
  MEMBER_DELETED: (member) => ({
    type: "membre",
    title: "Profil supprimé",
    message: `${member.name} a été retiré de la base.`,
    link: `/admin/membres`,
  }),

  // 📌 Lorsqu’un message est reçu via "Nous Contacter"
  NEW_CONTACT_MESSAGE: (cm) => ({
    type: "message",
    title: "Nouveau message reçu",
    message: `Message de ${cm.name} : ${cm.subject}`,
    link: `/admin/contacts/${cm.id}`,
  }),

  // 📌 Lorsqu’un admin répond à un contact
  CONTACT_REPLIED: (cm) => ({
    type: "message",
    title: "Réponse envoyée",
    message: `Réponse envoyée à ${cm.name}.`,
    link: `/admin/contacts/${cm.id}`,
  }),

  // 📌 Lorsqu’un événement est créé
  EVENT_CREATED: (event) => ({
    type: "event",
    title: "Nouvel événement publié",
    message: `${event.title} a été ajouté à l’agenda.`,
    link: `/admin/events/${event.id}`,
  }),

  // 📌 Lorsqu’un événement est supprimé
  EVENT_DELETED: (event) => ({
    type: "event",
    title: "Événement supprimé",
    message: `${event.title} a été retiré de l’agenda.`,
    link: `/admin/events`,
  }),

  // 📌 Notification système pour erreurs, alertes, etc.
  SYSTEM_ALERT: (text) => ({
    type: "system",
    title: "Alerte système",
    message: text,
    link: null,
  }),
};
