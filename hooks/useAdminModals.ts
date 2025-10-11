'use client';

import { useState } from 'react';

export function useAdminModals() {
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const closeAllModals = () => {
    setShowServiceForm(false);
    setShowTestimonialForm(false);
    setShowStaffForm(false);
    setShowTeamForm(false);
    setShowAssignmentForm(false);
    setShowMemberForm(false);
  };

  return {
    // Service modal
    showServiceForm,
    setShowServiceForm,
    
    // Testimonial modal
    showTestimonialForm,
    setShowTestimonialForm,
    
    // Staff modal
    showStaffForm,
    setShowStaffForm,
    
    // Team modal
    showTeamForm,
    setShowTeamForm,
    
    // Assignment modal
    showAssignmentForm,
    setShowAssignmentForm,
    
    // Member modal
    showMemberForm,
    setShowMemberForm,
    
    // Utility
    closeAllModals
  };
}
